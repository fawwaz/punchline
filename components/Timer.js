import React, { useState, useEffect, useRef } from "react";

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default function Timer() {
  const [timer, setTimer] = useState(120);

  useInterval(() => {
    if (timer > 0) {
      setTimer(timer - 1);
    }
  }, 1000);

  return (
    <>
      <h2>Remaining Time: {timer} </h2>
    </>
  );
}
