import { useState, useRef } from "react";
function Dashboard() {
  const inputRef = useRef(null);

  const [cnt, setCnt] = useState(0);

  return (
    <div>
      <h1 className="text-3xl font-bold underline text-center text-neutral-500">
        Dashboard, Hello
      </h1>
      <input type="text" ref={inputRef} placeholder="auto focus input" />
      <p>Count: {cnt}</p>
      <button onClick={() => setCnt(cnt + 1)}>+</button>
    </div>
  );
}

export default Dashboard;
