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
}


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
    
    function openModalForGoal(goalId: number|null){
      setSelectedGoalId(goalId);
      setShowModal(true);
    }
    const [taskTitle, setTaskTitle] = useState("")
    const [taskDescription, setTaskDescription] = useState("")
    
    const otherTasks = tasks.filter(t=> !t.goal_id);
    
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
  
    // This useEffect changes user field area in layout.tsx.
    // [] means only useEffect run only once. [username] means first time and when changing userneme.
    // Without [], useEffect runs everytime when rendering.
    useEffect(() => {
      const el = document.getElementById("sidebar-username");
      if (el) {
        el.textContent = username;
      }
    }, [username]);

  return (
    <>
      <div>Hello {username} </div>

      {goals.map(g => ( 
        <div key={g.id} className="bg-gray-900 p-4 rounded-xl shadow-md mb-10 mx-auto w-full">
          <h3 className="text-xl font-semibold text-white mb-1">{g.title}</h3>
          <p className="text-gray-400 mb-3">{g.description}</p>
          
          {tasks
            .filter(t => t.goal_id === g.id)
            .map(t => 
              (<div key={t.id} className="text-gray-200 py-1 px-2 bg-gray-800 rounded-lg mb-1 max-w-xl">
                {t.title}
              </div>)
            )
          }
          <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
            onClick={()=> openModalForGoal(g.id)}
          >
            タスクを追加
          </button>
        </div>
        
      ))}
      
      {otherTasks.length > 0 && (
        <div className="bg-gray-900 p-4 rounded-xl shadow-md mb-10 mx-auto w-full">
          <h3 className="text-xl font-semibold text-white mb-1">その他のタスク</h3>
          <p className="text-gray-400 mb-3">目標に紐づかないが、やるべきタスクなど</p>
          {tasks
            .filter(t=>t.goal_id==null)
            .map(t => 
              (<div key={t.id} className="text-gray-200 py-1 px-2 bg-gray-800 rounded-lg mb-1 mb-1 max-w-xl">
                {t.title}
              </div>)
            )
          }
          <button className="mt-3 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500"
            onClick={()=> openModalForGoal(null)}
          >
            タスクを追加
          </button>
        </div>
      )}
      
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
            <div className="flex justify-end gap-2">
              <button onClick={()=>setShowModal(false)}
                className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
              >
                キャンセル
              </button>
              <button
                // when you write onClick={ addTask(appUserId) }, it runs immediately.
                // when you give addTask function to onClick, you should wrap with {}.
                onClick={() => addTask(appUserId)}
                className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-500"
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
  }
  // same as 
  // tasks.map((t) => {
  // return <div key={t.id}>{t.title}</div>;
  // })

  // A && B means that return B if A is true, but return A if A is false.
  // REACT doesn't render false to the browser.