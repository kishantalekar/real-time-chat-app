"use client";
import Image from "next/image";
import { useEffect, useId, useState } from "react";

import { io } from "socket.io-client";

interface Msg {
  message: string;
  author: string;
  time: string;
}
const RecivedMsg = ({ message, author, time }: Msg) => {
  return (
    <div className=" py-2 px-2">
      <div className="md:w-1/2 w-3/4">
        <div className="bg-gray-300 px-2 py-2  rounded-lg flex flex-1 ">
          <p className="text-gray-600 text-sm sm:text-lg">{message}</p>
        </div>
        <div className="flex justify-between pl-2">
          <span className="text-sm text-gray-500 sm:text-base">{author}</span>
          <span className="text-sm text-gray-500 sm:text-base">{time}</span>
        </div>
      </div>
    </div>
  );
};
const MyMsg = ({ message, author, time }: Msg) => {
  return (
    <div className="grid justify-items-end  py-2 px-2">
      <div className="md:w-1/2 w-3/4">
        <div className="bg-green-500 px-2 py-2  rounded-lg flex flex-1 ">
          <p className="text-white  sm:text-lg text-sm">{message}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 sm:text-base">{time}</span>
        </div>
      </div>
    </div>
  );
};

const data = [
  {
    message: "heelo",
    author: "kishan",
    time: "4.00pm",
  },
  {
    message: "heelo",
    author: "kirito",
    time: "4.05pm",
  },
  {
    message: "how are you",
    author: "kishan",
    time: "4.10pm",
  },
];
export default function Home() {
  const [activeList, setActiveList] = useState([]);
  const [chatList, setChatList] = useState<any>([]);
  const [userName, setUserName] = useState(
    `User${Math.floor(Math.random() * 1000000)}`
  );
  const [message, setMessage] = useState("");
  const url = process.env.IS_PRODUCTION
    ? process.env.SERVER_URL
    : process.env.LOCAL_SERVER_URL;
  const socket = io(`${url}`);

  const newUserConnected = () => {
    socket.emit("new_user", userName);
  };

  const sendMessage = (e: any) => {
    e.preventDefault();
    const data = {
      message: message,
      author: userName,
      time: new Date(),
    };
    socket.emit("chat_message", data);
    setMessage("");
  };
  useEffect(() => {
    newUserConnected();

    // Listen for new users and update the active list
    socket.on("new_user", (data) => {
      setActiveList(data);
    });
    socket.on("chat_message", (data) => {
      setChatList((prev: any) => [...prev, data]);
    });
    // Listen for user disconnections and update the active list
    socket.on("user_disconnected", (userId) => {
      setActiveList((prevList) => prevList.filter((user) => user !== userId));
    });
  }, [userName]);

  return (
    <div className="flex flex-1 flex-col h-screen bg-white box-border border-collapse py-10">
      <div className="flex flex-1 py-5 sm:px-10 px-4 ">
        <div className="flex flex-none  sm:w-48  w-28 bg-gray-100 border-y border-l border-gray-700 flex-col sm:px-10 sm:py-10 px-2 py-2rounded-l-lg gap-5">
          <div className="">
            <h4 className="text-zinc-950 font-bold sm:text-md text-sm">
              Active users
            </h4>
            <hr className="h-px sm:my-8 mt-4 bg-gray-200 border-0 dark:bg-gray-700"></hr>
          </div>
          {activeList.map((user: string) => (
            <div className="flex flex-row items-center gap-2" key={user}>
              <div className="w-2 h-2 rounded-full bg-green-600"></div>
              <h5 className="text-lime-800 font-bold sm:text-md text-sm">
                {user.toString()}
              </h5>
            </div>
          ))}
        </div>
        <div className="flex flex-1  bg-white border border-lime-700 border-collapse rounded-r-lg flex-col">
          {chatList.map((msg: Msg, i: number) => {
            return msg.author === userName ? (
              <MyMsg {...msg} key={i} />
            ) : (
              <RecivedMsg {...msg} key={i} />
            );
          })}
        </div>
      </div>
      <div className="sm:px-10 px-2">
        <form onSubmit={sendMessage} className="flex justify-between gap-2">
          <input
            type="text"
            value={message}
            placeholder="type a message"
            onChange={(e) => setMessage(e.target.value)}
            className="flex flex-1 text-black  border-black rounded-lg pl-2"
          />
          <button className="bg-green-500 rounded-lg h-10 px-2 text-white">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
