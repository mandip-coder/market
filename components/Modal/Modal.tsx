'use client';
import { Modal, ModalProps } from 'antd';

const ModalWrapper = ({className, children,  ...rest}:ModalProps) => {
  return (
    <Modal
      {...rest}
    >
        {children}
    </Modal>
  );
};

export default ModalWrapper;
