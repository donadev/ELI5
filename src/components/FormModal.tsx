import { useStore } from "@/store";
import { ChangeEvent, ChangeEventHandler, useState } from "react";
import mixpanel from 'mixpanel-browser';
import validator from "validator";

interface FormModalProps {
}

const FormModal: React.FC<FormModalProps> = () => {
    
    const convertUser = useStore((state) => state.convertUser);
    const toggleModal = useStore((state) => state.toggleModal);
    const [email, setEmail] = useState("")
    const [valid, setValid] = useState(false)

    const onInputChange = (event : ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value
      setEmail(text)
      setValid(validator.isEmail(text))
    }

    const applyClick = () => {
        mixpanel.track("emailSubmitted", {email: email})
        mixpanel.register({"email": email})
        convertUser(email)
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
                <p className="text-sm text-gray-500">Please <strong>leave your mail</strong> to join the Beta waitlist. We will contact you shortly.</p>
              </div>
              <div className="mt-2">
              <input type="text" onChange={onInputChange} placeholder="Your best email here" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"/>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
          <button type="button" disabled={!valid} onClick={applyClick} className="inline-flex w-full justify-center rounded-md bg-sky-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-400 sm:ml-3 sm:w-auto disabled:bg-slate-50 disabled:text-slate-500">Apply to the Beta</button>
          <button type="button" onClick={dismissClick} className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default FormModal;
