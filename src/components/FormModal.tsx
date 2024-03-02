import { useStore } from "@/store";
import { useState } from "react";

interface FormModalProps {
}

const FormModal: React.FC<FormModalProps> = () => {
    
    const openForm = useStore((state) => state.openForm);
    const toggleModal = useStore((state) => state.toggleModal);

    const applyClick = () => {
        openForm()
        dismissClick()
    }
    const dismissClick = () => {
        toggleModal(false)
    }

  return (
    
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

  <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
          <div className="sm:flex sm:items-start">
              <p className="h-6 w-6 text-red-600" aria-hidden="true">
                😄
              </p>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Are you enjoying ELI5?</h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">Jump to <strong>ELI5 PRO!</strong> We're rolling out the first Beta of the Pro version to the first <strong>1000 users</strong>.</p>
                <p className="text-sm text-gray-500">Please Apply to the Beta and answer the Form linked to join the Beta waitlist.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button type="button" onClick={applyClick} className="inline-flex w-full justify-center rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 sm:ml-3 sm:w-auto">Apply to the Beta</button>
          <button type="button" onClick={dismissClick} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default FormModal;
