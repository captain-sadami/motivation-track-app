"use client";

import { useState, useEffect } from "react"; 


type Task = {
  id: number;
  created_at: string;
  user_id: number;
  goal_id: number;
  title: string;
  description?: string;
  is_completed: boolean;
  completed_at?: string;
  priority: number;
  updated_at?: string;
};

type Goal = {
  id: number;
  created_at: string;
  title: string;
  description: string;
  owner_type?: string;
  owner_id?: number;
  department_id: number;
  is_active: boolean;
};


export default function HomeClient({ username, appUserId, tasks, goals }:
  { username: string;
    appUserId: number;
    tasks: Task[];
    goals: Goal[];
  })
  {
    const [showModal, setShowModal] = useState(false);
    // goalId is nullable, so type is assined by union <xx|xx>
    const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
    function openModalForTask(goalId: number|null){
      setSelectedGoalId(goalId);
      setShowModal(true);
    }

    const [taskTitle, setTaskTitle] = useState("")
    const [taskDescription, setTaskDescription] = useState("")    
    async function addTask(appUserId: number){
      if (!taskTitle) return;
      await fetch("/api/addTask", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({
          title: taskTitle,
          description: taskDescription,
          goal_id: selectedGoalId,
          identity_id: appUserId,
        })
      })
      window.location.reload()

      // when finishing add task, poperties are initialized
      setShowModal(false)
      setTaskTitle("");
      setTaskDescription("")
    }

    const otherTasks = tasks.filter(t => t.goal_id==null);
  
    // This useEffect changes user field area in layout.tsx.
    // [] means only useEffect run only once. [username] means first time and when changing userneme.
    // Without [], useEffect runs everytime when rendering.
    // moved to AppShell.tsx
    //useEffect(() => {
    //  const el = document.getElementById("sidebar-username");
    //  if (el) {
    //    el.textContent = username;
    //  }
    //}, [username]);

    const [showProgressModal, setShowProgressModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [progressComment, setProgressComment] = useState("");
    function openProgressModal(task: Task) {
      setSelectedTask(task);
      setShowProgressModal(true);
    }

    const [markAsCompleted, setMarkAsCompleted] = useState(false);
    async function submitProgress(){
      if (!selectedTask || !progressComment) return;
      await fetch("/api/addProgress",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task_id: selectedTask.id,
          user_id: appUserId,
          comment: progressComment,
          mark_as_completed: markAsCompleted, // added for task complete
        }),
      });

      // clean up
      setShowProgressModal(false);
      setProgressComment("");
      setSelectedTask(null);
      setMarkAsCompleted(false);
      
      window.location.reload()
    }

    //const [menuOpen, setMenuOpen] = useState(false);
    const [openMenuGoalId, setOpenMenuGoalId] = useState<number | null>(null);    
    async function completeGoal(goalId: number){
      await fetch("/api/completeGoal",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          goal_id: goalId
        }
        )
      })
      setOpenMenuGoalId(null)
      window.location.reload()
    }

    const [showGoalModal, setShowGoalModal] = useState(false);
    const [selectedGoal4Modal, setSelectedGoal4Modal] = useState<Goal | null>(null);
    function openGoalModal(goal: Goal){
      setSelectedGoal4Modal(goal);
      setGoalTitle(goal.title);
      setGoalDescription(goal.description);
      setShowGoalModal(true);
    }

    const [goalTitle, setGoalTitle] = useState("")
    const [goalDescription, setGoalDescription] = useState("")
    async function updateGoal(appUserId: number){

      await fetch("/api/updateGoal", {
        method:"POST",
        headers: {"Content-Type": "application/json"},
        body:JSON.stringify({
          title: goalTitle,
          description: goalDescription,
          goal_id: selectedGoal4Modal?.id,
          identity_id: appUserId,
        })
      })
      window.location.reload()

      // when finishing add task, poperties are initialized
      setShowGoalModal(false)
      setGoalTitle("");
      setGoalDescription("")
    }

    const [showAddGoalModal, setAddGoalModal] = useState(false)
    async function openAddGoalModal(){
      setAddGoalModal(true)
    }

    return (
      <>
        <h1 className="p-4 text-xl font-semibold text-gray-200">
          Hello, {username.split(" ")[0]}
        </h1>

        {goals
          .filter(g=>g.is_active===true)
          .map(g => ( 
          <div key={g.id} className="bg-gray-900 p-4 rounded-xl shadow-md mb-10 mx-auto w-full">
            <div className="relative flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">{g.title}</h3>
                <p className="text-gray-400 mb-3">{g.description}</p>
              </div>
              <button 
                className="text-gray-400 hover:text-white text-2xl px-2 py-1 rounded-md hover:bg-gray-700"
                onClick={() => setOpenMenuGoalId(prev=>prev===g.id ? null : g.id)}
              >{ /* if prev===g.id return null else g.id */ }
                ⋮
              </button>
              {openMenuGoalId === g.id && (
                <div className=" absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-20">
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                    onClick={() => {
                      setOpenMenuGoalId(null);
                      openGoalModal(g);
                    }}
                  >
                    編集
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 hover:bg-gray-700"
                    onClick={() => {
                      setOpenMenuGoalId(null);
                      completeGoal(g.id)
                    }}
                  >
                    目標を達成
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-gray-400 hover:bg-gray-700"
                    onClick={() => {
                      setOpenMenuGoalId(null);
                    }}
                  >
                    キャンセル
                  </button>
                </div>
              )}
            </div>
            {tasks
              .filter(t => t.goal_id===g.id && !t.is_completed)
              .map(t => 
                (<div key={t.id} className="text-gray-200 py-1 px-2 bg-gray-800 rounded-lg mb-1 max-w-xl flex justify-between items-center">
                  <span>{t.title}</span>
                  <button
                    className="text-sm text-blue-400 hover:text-blue-300"
                    onClick={() => openProgressModal(t)}
                  >
                    進捗記入
                  </button>
                </div>)
              )
            }
            <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
              onClick={()=> openModalForTask(g.id)}
            >
              タスクを追加
            </button>
          </div>
        ))}


        <div className="bg-gray-900 p-4 rounded-xl shadow-md mb-10 mx-auto w-full">
          <h3 className="text-xl font-semibold text-white mb-1">その他のタスク</h3>
          <p className="text-gray-400 mb-3">目標に紐づかないが、やるべきタスクなど</p>
          {tasks
            .filter(t=>t.goal_id==null)
            .map(t => 
              (<div key={t.id} className="text-gray-200 py-1 px-2 bg-gray-800 rounded-lg mb-1 max-w-xl flex justify-between items-center">
                {t.title}
                <button
                  className="text-sm text-blue-400 hover:text-blue-300"
                  onClick={() => openProgressModal(t)}
                >
                  進捗記入
                </button>
              </div>
              )
            )
          }
          <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
            onClick={()=> openModalForTask(null)}
          >
            タスクを追加
          </button>
        </div>
        

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">タスクを追加</h2>
              <input type="text" placeholder="タスク名" 
               value={taskTitle}
               onChange={(e)=>setTaskTitle(e.target.value)}
               className="w-full p-2 rounded bg-gray-800 text-white mb-3"
              />

              <textarea placeholder="詳細（任意）" 
               value={taskDescription}
               onChange={(e)=>setTaskDescription(e.target.value)}
               className="w-full p-2 rounded bg-gray-800 text-white mb-3"
              />

              {/* close and send button */}
              <div className="flex justify-between items-center">
                <button onClick={()=>setShowModal(false)}
                  className="text-sm text-gray-400 hover:text-gray-200 whitespace-nowrap"
                >
                  キャンセル
                </button>
                <button
                  // when you write onClick={ addTask(appUserId) }, it runs immediately.
                  // when you give addTask function to onClick, you should wrap with {}.
                  onClick={() => addTask(appUserId)}
                  className="px-4 py-3 rounded bg-blue-600 text-white hover:bg-blue-500 whitespace-nowrap"
                >
                  送信
                </button>
              </div>
            </div>
          </div>
        )}


        {/* if showProgressModal is True and selectedTask is true, Modal emerges */}
        {showProgressModal && selectedTask && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
              <h2 className="text-xl font-semibold text-white mb-4">進捗を追加:{selectedTask.title}</h2>

              <textarea
               value={progressComment}
               onChange={(e)=>setProgressComment(e.target.value)}
               className="w-full p-2 rounded bg-gray-800 text-white mb-3"
               placeholder="目標の詳細"
              />

              {/* close and send button */}
              <div className="flex justify-end gap-2">
                <button onClick={()=> {
                      setShowProgressModal(false);
                      setProgressComment("");
                      setSelectedTask(null);
                    }
                  }
                  className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
                >
                  キャンセル
                </button>
                <button
                  onClick={submitProgress}
                  className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                >
                  送信
                </button>
                <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                  <input
                    type="checkbox"
                    checked={markAsCompleted}
                    onChange={e => setMarkAsCompleted(e.target.checked)}
                  />
                  このタスクを完了にする
                </label>
              </div>
            </div>
          </div>
        )}

        {showGoalModal && selectedGoal4Modal && (
          <div>
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-4">目標を編集</h2>
                
                <textarea
                 value={goalTitle}
                 onChange={(e)=>setGoalTitle(e.target.value)}
                 className="w-full p-2 rounded bg-gray-800 text-white mb-3"
                 placeholder="目標タイトル"
                />

                <textarea
                 value={goalDescription}
                 onChange={(e)=>setGoalDescription(e.target.value)}
                 className="w-full p-2 rounded bg-gray-800 text-white mb-3"
                 placeholder="目標の詳細"
                />

                {/* close and send button */}
                <div className="flex justify-end gap-2">
                  <button onClick={()=> {
                        setShowGoalModal(false);
                        setGoalDescription("");
                        setSelectedGoal4Modal(null);
                      }
                    }
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={()=>{updateGoal(appUserId)}}
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showAddGoalModal &&(
          <div>
            <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
              <div className="bg-gray-900 p-6 rounded-xl w-96 shadow-xl">
                <h2 className="text-xl font-semibold text-white mb-4">目標を編集</h2>
                
                <textarea
                 value={goalTitle}
                 onChange={(e)=>setGoalTitle(e.target.value)}
                 className="w-full p-2 rounded bg-gray-800 text-white mb-3"
                 placeholder="目標タイトル"
                />

                <textarea
                 value={goalDescription}
                 onChange={(e)=>setGoalDescription(e.target.value)}
                 className="w-full p-2 rounded bg-gray-800 text-white mb-3"
                 placeholder="目標の詳細"
                />

                {/* close and send button */}
                <div className="flex justify-end gap-2">
                  <button onClick={()=> {
                        setAddGoalModal(false);
                        setGoalDescription("");
                        setGoalTitle("");
                      }
                    }
                    className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
                  >
                    キャンセル
                  </button>
                  <button
                    onClick={()=>{
                        updateGoal(appUserId);
                        setAddGoalModal(false);
                        setGoalDescription("");
                        setGoalTitle("");
                      }
                    }
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
                  >
                    送信
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end mb-6">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500"
            onClick={()=>openAddGoalModal()}
          >
            + 目標を追加
          </button>
        </div>
        
      </>
    );
  }
  // same as 
  // tasks.map((t) => {
  // return <div key={t.id}>{t.title}</div>;
  // })

  // A && B means that return B if A is true, but return A if A is false.
  // REACT doesn't render false to the browser.