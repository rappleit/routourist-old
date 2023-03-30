import Modal from 'react-modal'
import React from 'react'
import {useState} from 'react'

Modal.setAppElement("#__next");

const Popup = ({validwaypoint}) => {
    console.log(validwaypoint)
    const [isOpen,setisOpen] = useState(false)

    const closeModal = () => {
        setIsOpen(false);
      };
    
      const openModal = () => {
        setIsOpen(true);
      };

    if (!validwaypoint){
        return (
            <>
                <h1>ERROR</h1>
              <button onClick={openModal}>Open Modal</button>
              <Modal isOpen={isOpen} onRequestClose={closeModal}>
                <h2>Modal Content</h2>
                <button onClick={closeModal}>Close Modal</button>
              </Modal>
            </>
          ); 
    }

    else{
        return (
            <>
                <h1>VALID</h1>
              <button onClick={openModal}>Open Modal</button>
              <Modal isOpen={isOpen} onRequestClose={closeModal}>
                <h2>Modal Content</h2>
                <button onClick={closeModal}>Close Modal</button>
              </Modal>
            </>
          );
    }
}

export default Popup