import { useStore } from "@/store";
import { useEffect, useState } from "react";
import FormModal from "./FormModal";
import mixpanel from 'mixpanel-browser';



// A one-shot query
interface FormBubbleProps {
}

const FormBubble: React.FC<FormBubbleProps> = () => {
    const toggleModal = useStore((state) => state.toggleModal);
    const modalOpen = useStore((state) => state.modalOpen);

    const openModal = () => {
        mixpanel.track("openModal")
        toggleModal(true)
    }
    useEffect(() => {
      setTimeout(() => {
        mixpanel.track("bubbleAppeared")
      }, 1000)
    }, []);

  return (
    <div className="rounded-lg  mb-4">
        {modalOpen ? <FormModal/> : null}
        <p className="text-black">Discover the PRO version, it's free for the first users!</p>
        <button onClick={openModal} className="text-sky-400 underline"> Click here</button>
    </div>
  );
};

export default FormBubble;
