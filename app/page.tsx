"use client"
import Image from "next/image";
import Link from "next/link";
import { AppProvider } from "@/app/store"
import Menu from "./_components/Menu"
import Experience from "./_components/Experience"
import Modal from "./_components/Modal"
import Buttons from "./_components/Buttons"
import ProgressBar from "./_components/ProgressBar"
export default function Home() {
  return (
    <AppProvider>
      <div className="h-screen min-h-screen relative">
      <ProgressBar/>
        <Menu />
        <Buttons/>
        <Modal />
      <Experience />
      </div>
    </AppProvider>
  );
}
