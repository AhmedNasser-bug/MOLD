import{s as E}from"./sqlite3-worker1-promiser.BijQQgyW.js";class t{static instance;static initPromise=null;db;constructor(){}static async getInstance(){return t.instance||(console.log("[v0] DatabaseService: Creating new instance..."),t.instance=new t,await t.instance.init()),t.instance}async init(){if(t.initPromise){console.log("[v0] DatabaseService: Waiting for existing initialization..."),await t.initPromise;return}console.log("[v0] DatabaseService: Starting SQLite WASM initialization..."),t.initPromise=this.doInit();try{await t.initPromise,console.log("[v0] DatabaseService: Initialization complete")}finally{t.initPromise=null}}async doInit(){try{const i=await E({print:console.log,printErr:console.error,locateFile:e=>"/sqlite3.wasm"});"opfs"in i?(this.db=new i.oo1.OpfsDb("/game_data.sqlite3"),console.log("[v0] DatabaseService: OPFS persistence enabled")):(console.warn("[v0] DatabaseService: OPFS not available, using in-memory DB"),this.db=new i.oo1.DB("/game_data.sqlite3","ct")),this.migrate()}catch(i){throw console.error("[v0] DatabaseService: Initialization failed:",i),i}}migrate(){this.db.exec(`
            CREATE TABLE IF NOT EXISTS player (id INTEGER PRIMARY KEY, name TEXT, exp INTEGER);
            CREATE TABLE IF NOT EXISTS subject (
                id TEXT PRIMARY KEY,
                name TEXT,
                subject_api_uri TEXT,
                terminology TEXT,
                flashcards TEXT
            );
            CREATE TABLE IF NOT EXISTS question (
                id INTEGER,
                subject_id TEXT,
                category TEXT,
                type TEXT,
                question TEXT,
                options TEXT,
                correct TEXT,
                explanation TEXT,
                PRIMARY KEY (id, subject_id),
                FOREIGN KEY(subject_id) REFERENCES subject(id)
            );
            CREATE TABLE IF NOT EXISTS player_stats (
                id INTEGER PRIMARY KEY,
                player_id INTEGER,
                subject_id TEXT,
                high_score INTEGER,
                total_runs INTEGER DEFAULT 0,
                FOREIGN KEY(player_id) REFERENCES player(id),
                FOREIGN KEY(subject_id) REFERENCES subject(id)
            );
        `);try{this.db.exec("ALTER TABLE subject ADD COLUMN subject_api_uri TEXT;")}catch{}try{this.db.exec("ALTER TABLE subject ADD COLUMN terminology TEXT;")}catch{}try{this.db.exec("ALTER TABLE subject ADD COLUMN flashcards TEXT;")}catch{}}query(i,e=[]){const s=[];return this.db.exec({sql:i,bind:e,rowMode:"object",callback:n=>s.push(n)}),s}run(i,e=[]){this.db.exec({sql:i,bind:e})}async subjectExists(i){return this.query("SELECT id FROM subject WHERE id = ?",[i]).length>0}}export{t as D};
