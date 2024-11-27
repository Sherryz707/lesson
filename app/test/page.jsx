"use client"
import { AppProvider } from "@/app/store"
import Menu from "../_components/Menu"
import Experience from "./Experience"
import Modal from "../_components/Modal"
import Buttons from "../_components/Buttons"
import ProgressBar from "../_components/ProgressBar"
import {AnimManagerProvider} from "../animManager"
export default function Home() {
  return (
    <AppProvider>
      <AnimManagerProvider>
      <div className="h-screen min-h-screen relative">
      <ProgressBar/>
        <Menu />
        <Buttons/>
        <Modal />
      <Experience />
        </div>
        </AnimManagerProvider>
    </AppProvider>
  );
}
