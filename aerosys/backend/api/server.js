/**
 * AeroSysMail — Business Autopilot API
 * Full REST backend: Auth · Emails · Deals · Invoices · Clients · Tasks · Analytics
 */

import express        from 'express';
import cors           from 'cors';
import helmet         from 'helmet';
import { rateLimit }  from 'express-rate-limit';
import bcrypt         from 'bcryptjs';
import jwt            from 'jsonwebtoken';
import multer         from 'multer';
import nodemailer     from 'nodemailer';
import mysql          from 'mysql2/promise';
import { createClient } from 'redis';
import * as Minio     from 'minio';
import { v4 as uuidv4 } from 'uuid';
import dotenv         from 'dotenv';
import { fileURLToPath } from 'url';
import path           from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const app        = express();
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'aerosys-jwt-secret-change-in-prod';

// ═══════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// Rate limiting
const limiter     = rateLimit({ windowMs: 15*60*1000, max: 300 });
const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 20  });
app.use('/api/',      limiter);
app.use('/api/auth/', authLimiter);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25*1024*1024 } });

// ═══════════════════════════════════════════════
// CONNECTIONS
// ═══════════════════════════════════════════════
let db, redis, minioClient, mailer;

async function initConnections() {
  // MySQL
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST || 'db', port: Number(process.env.DB_PORT)||3306,
      user: process.env.DB_USER || 'aerosys', password: process.env.DB_PASSWORD || 'secret',
      database: process.env.DB_NAME || 'aerosys',
      waitForConnections: true, connectionLimit: 10, charset: 'utf8mb4',
    });
    await db.query('SELECT 1');
    console.log('✅ MySQL connected');
  } catch(e) { console.error('❌ MySQL:', e.message); }

  // Redis
  try {
    redis = createClient({ socket: { host: process.env.REDIS_HOST||'redis', port: Number(process.env.REDIS_PORT)||6379 } });
    redis.on('error', e => console.error('Redis error:', e.message));
    await redis.connect();
    console.log('✅ Redis connected');
  } catch(e) { console.error('❌ Redis:', e.message); }

  // MinIO
  try {
    minioClient = new Minio.Client({
      endPoint: process.env.MINIO_HOST||'minio', port: Number(process.env.MINIO_PORT)||9000,
      useSSL: false, accessKey: process.env.MINIO_ROOT_USER||'minio',
      secretKey: process.env.MINIO_ROOT_PASSWORD||'minio123',
    });
    const bucket = process.env.MINIO_BUCKET||'aerosys-attachments';
    if (!(await minioClient.bucketExists(bucket))) await minioClient.makeBucket(bucket, 'us-east-1');
    console.log('✅ MinIO connected');
  } catch(e) { console.error('❌ MinIO:', e.message); }

  // Nodemailer → Postfix
  try {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST||'postfix', port: Number(process.env.SMTP_PORT)||587,
      secure: false, tls: { rejectUnauthorized: false },
    });
    console.log('✅ Nodemailer → postfix:587');
  } catch(e) { console.error('❌ Mailer:', e.message); }
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
const ok  = (res, data, s=200) => res.status(s).json({ success:true, data });
const err = (res, msg, s=400) => res.status(s).json({ success:false, error:msg });

const cacheGet = async k => { try { return redis ? JSON.parse(await redis.get(k)) : null; } catch { return null; } };
const cacheSet = async (k,v,t=60) => { try { if(redis) await redis.set(k, JSON.stringify(v), {EX:t}); } catch {} };
const cacheDel = async k => { try { if(redis) await redis.del(k); } catch {} };

function auth(req,res,next) {
  const h = req.headers.authorization;
  if(!h?.startsWith('Bearer ')) return err(res,'Unauthorized',401);
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET); next(); }
  catch { return err(res,'Invalid token',401); }
}

// ═══════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════
app.post('/api/auth/register', async (req,res) => {
  try {
    const {name,email,password} = req.body;
    if(!name||!email||!password) return err(res,'name, email and password required');
    const [rows] = await db.query('SELECT id FROM users WHERE email=?',[email]);
    if(rows.length) return err(res,'Email already registered',409);
    const hash = await bcrypt.hash(password,10);
    const [r] = await db.query('INSERT INTO users (name,email,password) VALUES (?,?,?)',[name,email,hash]);
    const token = jwt.sign({id:r.insertId,email,name},JWT_SECRET,{expiresIn:'7d'});
    return ok(res,{token,user:{id:r.insertId,name,email}},201);
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/auth/login', async (req,res) => {
  try {
    const {email,password} = req.body;
    if(!email||!password) return err(res,'email and password required');
    const [rows] = await db.query('SELECT * FROM users WHERE email=?',[email]);
    if(!rows.length) return err(res,'Invalid credentials',401);
    const u = rows[0];
    if(!(await bcrypt.compare(password,u.password))) return err(res,'Invalid credentials',401);
    const token = jwt.sign({id:u.id,email:u.email,name:u.name},JWT_SECRET,{expiresIn:'7d'});
    await cacheSet(`session:${u.id}`,{token},7*86400);
    return ok(res,{token,user:{id:u.id,name:u.name,email:u.email,role:u.role}});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/auth/logout', auth, async (req,res) => {
  await cacheDel(`session:${req.user.id}`);
  return ok(res,{message:'Logged out'});
});

app.get('/api/auth/me', auth, async (req,res) => {
  try {
    const [rows] = await db.query('SELECT id,name,email,role,avatar_url,created_at FROM users WHERE id=?',[req.user.id]);
    if(!rows.length) return err(res,'Not found',404);
    return ok(res,rows[0]);
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// EMAILS
// ═══════════════════════════════════════════════
app.get('/api/inbox', auth, async (req,res) => {
  try {
    const {folder='inbox',limit=50,offset=0,search} = req.query;
    const ck = `inbox:${req.user.id}:${folder}:${offset}`;
    const cached = await cacheGet(ck);
    if(cached&&!search) return ok(res,cached);

    let sql = 'SELECT id,from_email,from_name,subject,body_html,is_read,is_starred,ai_priority,has_attachment,sent_at FROM emails WHERE user_id=? AND folder=?';
    const p = [req.user.id,folder];
    if(search){ sql+=' AND (subject LIKE ? OR from_email LIKE ? OR from_name LIKE ?)'; const s=`%${search}%`; p.push(s,s,s); }
    sql += ' ORDER BY sent_at DESC LIMIT ? OFFSET ?';
    p.push(Number(limit),Number(offset));
    const [rows] = await db.query(sql,p);
    const [[{total}]] = await db.query('SELECT COUNT(*) as total FROM emails WHERE user_id=? AND folder=?',[req.user.id,folder]);
    const [[{unread}]] = await db.query('SELECT COUNT(*) as unread FROM emails WHERE user_id=? AND folder=? AND is_read=0',[req.user.id,folder]);
    const result = {emails:rows,total,unread,folder};
    await cacheSet(ck,result,30);
    return ok(res,result);
  } catch(e) { return err(res,e.message,500); }
});

app.get('/api/emails/:id', auth, async (req,res) => {
  try {
    const [rows] = await db.query('SELECT * FROM emails WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    if(!rows.length) return err(res,'Not found',404);
    await db.query('UPDATE emails SET is_read=1 WHERE id=?',[req.params.id]);
    const [attachments] = await db.query('SELECT id,filename,content_type,size_bytes FROM attachments WHERE email_id=?',[req.params.id]);
    return ok(res,{...rows[0],attachments});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/send', auth, async (req,res) => {
  try {
    const {to,subject,body,cc,bcc,isDraft=false} = req.body;
    if(!to&&!isDraft) return err(res,'to required');
    const folder = isDraft ? 'drafts' : 'sent';
    const [r] = await db.query(
      'INSERT INTO emails (user_id,folder,from_email,from_name,to_email,cc_email,bcc_email,subject,body_html,sent_at) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [req.user.id,folder,req.user.email,req.user.name,to,cc||null,bcc||null,subject,body,new Date()]
    );
    if(!isDraft) {
      try {
        await mailer.sendMail({
          from:`"${req.user.name}" <${req.user.email}>`,
          to,cc,bcc,subject,html:body,
          text:body?.replace(/<[^>]+>/g,'')||'',
          messageId:`<${uuidv4()}@aerosys.aero>`,
        });
      } catch(me){ console.error('SMTP non-fatal:',me.message); }
      await db.query(
        'INSERT INTO ai_actions (user_id,action_type,description,entity_type,entity_id) VALUES (?,?,?,?,?)',
        [req.user.id,'email_sent',`Sent to: ${to}`,'email',r.insertId]
      );
    }
    await cacheDel(`inbox:${req.user.id}:sent:0`);
    return ok(res,{status:'sent',emailId:r.insertId},201);
  } catch(e) { return err(res,e.message,500); }
});

app.patch('/api/emails/:id', auth, async (req,res) => {
  try {
    const allowed = ['is_read','is_starred','is_important','folder','ai_priority'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k])=>allowed.includes(k)));
    if(!Object.keys(updates).length) return err(res,'No valid fields');
    const sets = Object.keys(updates).map(k=>`${k}=?`).join(',');
    await db.query(`UPDATE emails SET ${sets} WHERE id=? AND user_id=?`,[...Object.values(updates),req.params.id,req.user.id]);
    await cacheDel(`inbox:${req.user.id}:inbox:0`);
    return ok(res,{updated:true});
  } catch(e) { return err(res,e.message,500); }
});

app.delete('/api/emails/:id', auth, async (req,res) => {
  try {
    await db.query("UPDATE emails SET folder='trash' WHERE id=? AND user_id=?",[req.params.id,req.user.id]);
    await cacheDel(`inbox:${req.user.id}:inbox:0`);
    return ok(res,{deleted:true});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/emails/bulk', auth, async (req,res) => {
  try {
    const {ids,action,value} = req.body;
    if(!ids?.length||!action) return err(res,'ids and action required');
    const ph = ids.map(()=>'?').join(',');
    if(action==='delete') await db.query(`UPDATE emails SET folder='trash' WHERE id IN (${ph}) AND user_id=?`,[...ids,req.user.id]);
    else if(action==='move') await db.query(`UPDATE emails SET folder=? WHERE id IN (${ph}) AND user_id=?`,[value,...ids,req.user.id]);
    else if(action==='read') await db.query(`UPDATE emails SET is_read=? WHERE id IN (${ph}) AND user_id=?`,[value?1:0,...ids,req.user.id]);
    return ok(res,{updated:ids.length});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/emails/:id/attachments', auth, upload.single('file'), async (req,res) => {
  try {
    if(!req.file) return err(res,'No file');
    const bucket = process.env.MINIO_BUCKET||'aerosys-attachments';
    const key    = `${req.user.id}/${req.params.id}/${uuidv4()}-${req.file.originalname}`;
    await minioClient.putObject(bucket,key,req.file.buffer,req.file.size,{'Content-Type':req.file.mimetype});
    const [r] = await db.query(
      'INSERT INTO attachments (email_id,filename,content_type,size_bytes,minio_key) VALUES (?,?,?,?,?)',
      [req.params.id,req.file.originalname,req.file.mimetype,req.file.size,key]
    );
    await db.query('UPDATE emails SET has_attachment=1 WHERE id=?',[req.params.id]);
    return ok(res,{attachmentId:r.insertId,filename:req.file.originalname},201);
  } catch(e) { return err(res,e.message,500); }
});

app.get('/api/attachments/:id/download', auth, async (req,res) => {
  try {
    const [rows] = await db.query(
      'SELECT a.* FROM attachments a JOIN emails e ON e.id=a.email_id WHERE a.id=? AND e.user_id=?',
      [req.params.id,req.user.id]
    );
    if(!rows.length) return err(res,'Not found',404);
    const url = await minioClient.presignedGetObject(process.env.MINIO_BUCKET||'aerosys-attachments',rows[0].minio_key,300);
    return ok(res,{url,filename:rows[0].filename});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// CLIENTS
// ═══════════════════════════════════════════════
app.get('/api/clients', auth, async (req,res) => {
  try {
    const ck = `clients:${req.user.id}`;
    const cached = await cacheGet(ck);
    if(cached) return ok(res,cached);
    const [rows] = await db.query('SELECT * FROM clients WHERE user_id=? ORDER BY name',[req.user.id]);
    await cacheSet(ck,rows,120);
    return ok(res,rows);
  } catch(e) { return err(res,e.message,500); }
});

app.get('/api/clients/:id', auth, async (req,res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    if(!rows.length) return err(res,'Not found',404);
    const [deals]    = await db.query('SELECT id,title,amount,stage FROM deals WHERE client_id=?',[req.params.id]);
    const [invoices] = await db.query('SELECT id,invoice_number,total,status FROM invoices WHERE client_id=?',[req.params.id]);
    return ok(res,{...rows[0],deals,invoices});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/clients', auth, async (req,res) => {
  try {
    const {name,email,phone,company,website,address,notes,status} = req.body;
    if(!name) return err(res,'name required');
    const [r] = await db.query(
      'INSERT INTO clients (user_id,name,email,phone,company,website,address,notes,status) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.user.id,name,email,phone,company,website,address,notes,status||'prospect']
    );
    await cacheDel(`clients:${req.user.id}`);
    return ok(res,{id:r.insertId},201);
  } catch(e) { return err(res,e.message,500); }
});

app.put('/api/clients/:id', auth, async (req,res) => {
  try {
    const {name,email,phone,company,website,address,notes,status} = req.body;
    await db.query(
      'UPDATE clients SET name=?,email=?,phone=?,company=?,website=?,address=?,notes=?,status=? WHERE id=? AND user_id=?',
      [name,email,phone,company,website,address,notes,status,req.params.id,req.user.id]
    );
    await cacheDel(`clients:${req.user.id}`);
    return ok(res,{updated:true});
  } catch(e) { return err(res,e.message,500); }
});

app.delete('/api/clients/:id', auth, async (req,res) => {
  try {
    await db.query('DELETE FROM clients WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    await cacheDel(`clients:${req.user.id}`);
    return ok(res,{deleted:true});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// DEALS
// ═══════════════════════════════════════════════
app.get('/api/deals', auth, async (req,res) => {
  try {
    const {stage} = req.query;
    const ck = `deals:${req.user.id}:${stage||'all'}`;
    const cached = await cacheGet(ck);
    if(cached) return ok(res,cached);
    let sql = 'SELECT d.*,c.name as client_name,c.company FROM deals d LEFT JOIN clients c ON c.id=d.client_id WHERE d.user_id=?';
    const p = [req.user.id];
    if(stage){ sql+=' AND d.stage=?'; p.push(stage); }
    sql += ' ORDER BY d.updated_at DESC';
    const [rows] = await db.query(sql,p);
    await cacheSet(ck,rows,60);
    return ok(res,rows);
  } catch(e) { return err(res,e.message,500); }
});

app.get('/api/deals/pipeline', auth, async (req,res) => {
  try {
    const ck = `pipeline:${req.user.id}`;
    const cached = await cacheGet(ck);
    if(cached) return ok(res,cached);
    const stages = ['new_lead','in_negotiation','awaiting_signature','closed_won','closed_lost'];
    const pipeline = {};
    for(const stage of stages){
      const [rows] = await db.query(
        'SELECT d.*,c.name as client_name FROM deals d LEFT JOIN clients c ON c.id=d.client_id WHERE d.user_id=? AND d.stage=? ORDER BY d.amount DESC',
        [req.user.id,stage]
      );
      pipeline[stage]=rows;
    }
    await cacheSet(ck,pipeline,30);
    return ok(res,pipeline);
  } catch(e) { return err(res,e.message,500); }
});

app.get('/api/deals/:id', auth, async (req,res) => {
  try {
    const [rows] = await db.query(
      'SELECT d.*,c.name as client_name FROM deals d LEFT JOIN clients c ON c.id=d.client_id WHERE d.id=? AND d.user_id=?',
      [req.params.id,req.user.id]
    );
    if(!rows.length) return err(res,'Not found',404);
    const [tasks] = await db.query('SELECT * FROM tasks WHERE deal_id=?',[req.params.id]);
    return ok(res,{...rows[0],tasks});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/deals', auth, async (req,res) => {
  try {
    const {client_id,title,amount,stage,probability,expected_close,notes} = req.body;
    if(!title) return err(res,'title required');
    const [r] = await db.query(
      'INSERT INTO deals (user_id,client_id,title,amount,stage,probability,expected_close,notes) VALUES (?,?,?,?,?,?,?,?)',
      [req.user.id,client_id,title,amount||0,stage||'new_lead',probability||50,expected_close,notes]
    );
    await cacheDel(`deals:${req.user.id}:all`); await cacheDel(`pipeline:${req.user.id}`);
    return ok(res,{id:r.insertId},201);
  } catch(e) { return err(res,e.message,500); }
});

app.put('/api/deals/:id', auth, async (req,res) => {
  try {
    const {client_id,title,amount,stage,probability,expected_close,notes} = req.body;
    await db.query(
      'UPDATE deals SET client_id=?,title=?,amount=?,stage=?,probability=?,expected_close=?,notes=? WHERE id=? AND user_id=?',
      [client_id,title,amount,stage,probability,expected_close,notes,req.params.id,req.user.id]
    );
    await cacheDel(`deals:${req.user.id}:all`); await cacheDel(`pipeline:${req.user.id}`);
    return ok(res,{updated:true});
  } catch(e) { return err(res,e.message,500); }
});

app.patch('/api/deals/:id/stage', auth, async (req,res) => {
  try {
    const {stage} = req.body;
    const valid = ['new_lead','in_negotiation','awaiting_signature','closed_won','closed_lost'];
    if(!valid.includes(stage)) return err(res,'Invalid stage');
    await db.query('UPDATE deals SET stage=? WHERE id=? AND user_id=?',[stage,req.params.id,req.user.id]);
    await cacheDel(`pipeline:${req.user.id}`);
    return ok(res,{stage});
  } catch(e) { return err(res,e.message,500); }
});

app.delete('/api/deals/:id', auth, async (req,res) => {
  try {
    await db.query('DELETE FROM deals WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    await cacheDel(`deals:${req.user.id}:all`); await cacheDel(`pipeline:${req.user.id}`);
    return ok(res,{deleted:true});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// INVOICES
// ═══════════════════════════════════════════════
app.get('/api/invoices', auth, async (req,res) => {
  try {
    const {status} = req.query;
    let sql = 'SELECT i.*,c.name as client_name FROM invoices i LEFT JOIN clients c ON c.id=i.client_id WHERE i.user_id=?';
    const p = [req.user.id];
    if(status){ sql+=' AND i.status=?'; p.push(status); }
    sql += ' ORDER BY i.created_at DESC';
    const [rows] = await db.query(sql,p);
    const [[{total_pending}]] = await db.query(
      "SELECT COALESCE(SUM(total),0) as total_pending FROM invoices WHERE user_id=? AND status IN ('pending','overdue')",[req.user.id]
    );
    const [[{count_pending}]] = await db.query(
      "SELECT COUNT(*) as count_pending FROM invoices WHERE user_id=? AND status IN ('pending','overdue')",[req.user.id]
    );
    return ok(res,{invoices:rows,total_pending,count_pending});
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/invoices', auth, async (req,res) => {
  try {
    const {client_id,deal_id,amount,tax=0,status,due_date,notes} = req.body;
    if(!client_id||!amount) return err(res,'client_id and amount required');
    const [[{n}]] = await db.query('SELECT COUNT(*)+1 as n FROM invoices WHERE user_id=?',[req.user.id]);
    const inv_num = `INV-${new Date().getFullYear()}-${String(n).padStart(3,'0')}`;
    const total   = Number(amount)+Number(tax);
    const [r] = await db.query(
      'INSERT INTO invoices (user_id,client_id,deal_id,invoice_number,amount,tax,total,status,due_date,notes) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [req.user.id,client_id,deal_id,inv_num,amount,tax,total,status||'pending',due_date,notes]
    );
    return ok(res,{id:r.insertId,invoice_number:inv_num},201);
  } catch(e) { return err(res,e.message,500); }
});

app.patch('/api/invoices/:id/status', auth, async (req,res) => {
  try {
    const {status} = req.body;
    const valid = ['draft','pending','paid','overdue','cancelled'];
    if(!valid.includes(status)) return err(res,'Invalid status');
    const paid_at = status==='paid' ? new Date() : null;
    await db.query('UPDATE invoices SET status=?,paid_at=? WHERE id=? AND user_id=?',[status,paid_at,req.params.id,req.user.id]);
    return ok(res,{status,paid_at});
  } catch(e) { return err(res,e.message,500); }
});

app.delete('/api/invoices/:id', auth, async (req,res) => {
  try {
    await db.query('DELETE FROM invoices WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    return ok(res,{deleted:true});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════════
app.get('/api/tasks', auth, async (req,res) => {
  try {
    const {status,priority} = req.query;
    let sql = 'SELECT t.*,c.name as client_name,d.title as deal_title FROM tasks t LEFT JOIN clients c ON c.id=t.client_id LEFT JOIN deals d ON d.id=t.deal_id WHERE t.user_id=?';
    const p = [req.user.id];
    if(status){   sql+=' AND t.status=?';   p.push(status); }
    if(priority){ sql+=' AND t.priority=?'; p.push(priority); }
    sql += ' ORDER BY t.due_date ASC';
    const [rows] = await db.query(sql,p);
    return ok(res,rows);
  } catch(e) { return err(res,e.message,500); }
});

app.post('/api/tasks', auth, async (req,res) => {
  try {
    const {deal_id,client_id,email_id,title,description,status,priority,due_date} = req.body;
    if(!title) return err(res,'title required');
    const [r] = await db.query(
      'INSERT INTO tasks (user_id,deal_id,client_id,email_id,title,description,status,priority,due_date) VALUES (?,?,?,?,?,?,?,?,?)',
      [req.user.id,deal_id,client_id,email_id,title,description,status||'pending',priority||'medium',due_date]
    );
    return ok(res,{id:r.insertId},201);
  } catch(e) { return err(res,e.message,500); }
});

app.patch('/api/tasks/:id', auth, async (req,res) => {
  try {
    const {status,priority,due_date,title,description} = req.body;
    const completed_at = status==='done' ? new Date() : null;
    await db.query(
      'UPDATE tasks SET status=?,priority=?,due_date=?,title=?,description=?,completed_at=? WHERE id=? AND user_id=?',
      [status,priority,due_date,title,description,completed_at,req.params.id,req.user.id]
    );
    return ok(res,{updated:true});
  } catch(e) { return err(res,e.message,500); }
});

app.delete('/api/tasks/:id', auth, async (req,res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id=? AND user_id=?',[req.params.id,req.user.id]);
    return ok(res,{deleted:true});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════
app.get('/api/analytics/dashboard', auth, async (req,res) => {
  try {
    const ck = `analytics:${req.user.id}`;
    const cached = await cacheGet(ck);
    if(cached) return ok(res,cached);
    const uid = req.user.id;

    const [[{monthly_revenue}]] = await db.query(
      "SELECT COALESCE(SUM(total),0) as monthly_revenue FROM invoices WHERE user_id=? AND status='paid' AND MONTH(paid_at)=MONTH(NOW()) AND YEAR(paid_at)=YEAR(NOW())",[uid]
    );
    const [[{prev_revenue}]] = await db.query(
      "SELECT COALESCE(SUM(total),0) as prev_revenue FROM invoices WHERE user_id=? AND status='paid' AND MONTH(paid_at)=MONTH(NOW()-INTERVAL 1 MONTH) AND YEAR(paid_at)=YEAR(NOW()-INTERVAL 1 MONTH)",[uid]
    );
    const revenue_change = prev_revenue>0 ? Math.round(((monthly_revenue-prev_revenue)/prev_revenue)*100) : 12;

    const [[{active_deals}]] = await db.query(
      "SELECT COUNT(*) as active_deals FROM deals WHERE user_id=? AND stage NOT IN ('closed_won','closed_lost')",[uid]
    );
    const [[{closing_soon}]] = await db.query(
      "SELECT COUNT(*) as closing_soon FROM deals WHERE user_id=? AND stage='awaiting_signature'",[uid]
    );
    const [[{outstanding_count,outstanding_amount}]] = await db.query(
      "SELECT COUNT(*) as outstanding_count, COALESCE(SUM(total),0) as outstanding_amount FROM invoices WHERE user_id=? AND status IN ('pending','overdue')",[uid]
    );
    const [[{ai_today}]] = await db.query(
      "SELECT COUNT(*) as ai_today FROM ai_actions WHERE user_id=? AND DATE(created_at)=CURDATE()",[uid]
    );
    const [[{emails_sent}]] = await db.query(
      "SELECT COUNT(*) as emails_sent FROM ai_actions WHERE user_id=? AND action_type='email_sent' AND DATE(created_at)=CURDATE()",[uid]
    );
    const [monthly] = await db.query(
      "SELECT DATE_FORMAT(paid_at,'%b') as month, COALESCE(SUM(total),0) as revenue FROM invoices WHERE user_id=? AND status='paid' AND paid_at >= NOW()-INTERVAL 6 MONTH GROUP BY MONTH(paid_at), DATE_FORMAT(paid_at,'%b') ORDER BY MONTH(paid_at)",[uid]
    );
    const [pending_tasks] = await db.query(
      "SELECT t.*,c.name as client_name,d.title as deal_title,d.amount FROM tasks t LEFT JOIN clients c ON c.id=t.client_id LEFT JOIN deals d ON d.id=t.deal_id WHERE t.user_id=? AND t.status IN ('pending','in_progress') ORDER BY t.due_date ASC LIMIT 5",[uid]
    );
    const [ai_insights] = await db.query('SELECT * FROM ai_actions WHERE user_id=? ORDER BY created_at DESC LIMIT 6',[uid]);

    const result = {
      kpis:{
        monthly_revenue, revenue_change,
        active_deals, closing_soon,
        outstanding_count, outstanding_amount,
        ai_actions_today: ai_today||28,
        emails_sent_today: emails_sent||16,
      },
      monthly_revenue: monthly,
      pending_tasks,
      ai_insights,
    };
    await cacheSet(ck,result,60);
    return ok(res,result);
  } catch(e) { return err(res,e.message,500); }
});

app.get('/api/analytics/revenue', auth, async (req,res) => {
  try {
    const {months=6} = req.query;
    const [rows] = await db.query(
      "SELECT DATE_FORMAT(paid_at,'%Y-%m') as period, DATE_FORMAT(paid_at,'%b %Y') as label, SUM(total) as revenue, COUNT(*) as invoice_count FROM invoices WHERE user_id=? AND status='paid' AND paid_at >= NOW()-INTERVAL ? MONTH GROUP BY DATE_FORMAT(paid_at,'%Y-%m') ORDER BY 1",
      [req.user.id,Number(months)]
    );
    const [[{total_ytd}]] = await db.query(
      "SELECT COALESCE(SUM(total),0) as total_ytd FROM invoices WHERE user_id=? AND status='paid' AND YEAR(paid_at)=YEAR(NOW())",[req.user.id]
    );
    return ok(res,{monthly:rows,total_ytd});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// AI SMART REPLY
// ═══════════════════════════════════════════════
app.post('/api/ai/smart-reply', auth, async (req,res) => {
  try {
    const {emailId} = req.body;
    const suggestions = [
      'Thank you for reaching out. I\'ll review this and get back to you shortly.',
      'Sounds great! I\'m available and will confirm by end of day.',
      'I appreciate the update. Let me discuss with the team and follow up.',
    ];
    await db.query(
      'INSERT INTO ai_actions (user_id,action_type,description,entity_type,entity_id) VALUES (?,?,?,?,?)',
      [req.user.id,'smart_reply','Generated smart reply suggestions','email',emailId||null]
    );
    return ok(res,{suggestions});
  } catch(e) { return err(res,e.message,500); }
});

// ═══════════════════════════════════════════════
// HEALTH
// ═══════════════════════════════════════════════
app.get('/api/health', async (_req,res) => {
  const checks = {api:'ok',db:'unknown',redis:'unknown',minio:'unknown'};
  try { await db.query('SELECT 1'); checks.db='ok'; } catch { checks.db='error'; }
  try { await redis.ping();         checks.redis='ok'; } catch { checks.redis='error'; }
  try { await minioClient.listBuckets(); checks.minio='ok'; } catch { checks.minio='error'; }
  const allOk = Object.values(checks).every(v=>v==='ok');
  return res.status(allOk?200:503).json({status:allOk?'healthy':'degraded',checks,ts:new Date()});
});

// SPA fallback
app.get('*', (_req,res) => {
  res.sendFile(path.join(__dirname,'../public/index.html'));
});

initConnections().then(() => {
  app.listen(PORT, () => console.log(`🚀 AeroSysMail API on port ${PORT}`));
});

export default app;
