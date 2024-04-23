import React from "react";
import { Modal } from "react-responsive-modal";
import "react-responsive-modal/styles.css";

const SubscriptionModal = ({ isOpen, handleClose, handleOk }) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      top
      classNames={{
        modal: "customModal",
      }}
    >
      <h2>Warning</h2>
      <div className="divider" />
      <p>
        If you unsubscribe too soon, you might lose your Instagram Followers.
        It's best to wait for a while before canceling the subscription to make
        sure you get all of them.
      </p>
      <div className="divider" />
      <div className="modal-buttons-area">
        <button className="styled-button ok-button" onClick={handleOk}>
          Cancel Now
        </button>
        <button className="styled-button cancel-button" onClick={handleClose}>
          Cancel in a week
        </button>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
