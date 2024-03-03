import { useStore } from "@/store";
import { useState } from "react";
import FormModal from "./FormModal";
import mixpanel from 'mixpanel-browser';

interface FormBubbleProps {
}

const FormBubble: React.FC<FormBubbleProps> = () => {
    const toggleModal = useStore((state) => state.toggleModal);
    const modalOpen = useStore((state) => state.modalOpen);

    const openModal = () => {
        mixpanel.track("openModal")
        toggleModal(true)
    }

  return (
    <div className="rounded-lg  mb-4">
        {modalOpen ? <FormModal/> : null}
        <p className="text-black">Are you enjoying this product?</p>
        <button onClick={openModal} className="text-sky-400 underline"> Click here</button>
    </div>
  );
};

export default FormBubble;
