// pages/index.js

import Link from "next/link"

export default () => {
  return (
    <main className="h-full">
      <div className="w-full h-full p-8 flex flex-row items-center justify-center">
        <Link href="/prototype" >
          <div className="bg-white w-48 h-48 m-8 rounded flex items-center justify-center">
            Prototype
          </div>
        </Link>

        <Link href="/chatbot" >
          <div className="bg-white w-48 h-48 m-8 rounded flex items-center justify-center">
            Chatbot Demo
          </div>
        </Link>

        <Link href="/widget">
          <div className="bg-white w-48 h-48 m-8 rounded flex items-center justify-center">
            Widgets Demo
          </div>
        </Link>
      </div>
    </main>
  )
}