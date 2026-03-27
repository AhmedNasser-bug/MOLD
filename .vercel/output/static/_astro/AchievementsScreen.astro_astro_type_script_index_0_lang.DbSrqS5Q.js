import{A as c}from"./UIStore.ChVE7lQX.js";import{P as a}from"./EventBus.CRxqgy7s.js";import"./DatabaseService.CfrBJ0iA.js";import"./sqlite3-worker1-promiser.BijQQgyW.js";class r{subject;currentPlayerId=1;constructor(){this.subject=window.subjectData,this.loadCurrentPlayer(),this.bindEvents()}async loadCurrentPlayer(){const t=a.getInstance();let e=await t.getPlayerByName("Default Player");e||(e=await t.createPlayer("Default Player")),this.currentPlayerId=e.id}bindEvents(){window.game=window.game||{},window.game.showAchievements=this.show.bind(this)}async show(){this.showScreen("achievementsScreen"),await this.render()}showScreen(t){document.querySelectorAll(".screen").forEach(e=>e.classList.remove("active")),document.getElementById(t)?.classList.add("active")}async render(){const t=c.getInstance(),e=document.getElementById("achievementsList");if(!e)return;const i=await t.getAchievementsBySubject(this.subject.id),s=(await t.getPlayerAchievements(this.currentPlayerId)).map(n=>n.achievementId);if(i.length===0){e.innerHTML='<p class="empty-message">No achievements available for this subject.</p>';return}e.innerHTML=i.map(n=>`
                    <div class="achievement-card ${s.includes(n.id)?"unlocked":"locked"}">
                        <div class="achievement-icon">${n.icon||"🏆"}</div>
                        <div class="achievement-info">
                            <h3>${n.title}</h3>
                            <p>${n.description}</p>
                        </div>
                    </div>
                `).join("")}}document.addEventListener("DOMContentLoaded",()=>{new r});
