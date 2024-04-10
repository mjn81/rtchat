import type { FC, PropsWithChildren, ReactSVG } from 'react';
import React from 'react';

interface ModalProps extends PropsWithChildren {
	isOpen: boolean;
	setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
	className?: string;
}

export type BaseModalProps<T> = T&{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
/**
 * Modal component is a wrapper component that renders a modal dialog.
 * @param isOpen - boolean
 * @param setIsOpen - React.Dispatch<React.SetStateAction<boolean>>
 * @description 
 * Wrap it around a component that you want to render as a modal. also it passes the isOpen and setIsOpen props to the children.
 * @example
 * 
 * ```tsx 
 * <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
 * <div className="shadow-md animate-go-down max-w-md w-full m-3 relative bg-white p-4 rounded-md">
 * </div>
 * </Modal>
 * ```
 * 
 */
export const Modal: FC<ModalProps> = ({children, isOpen, setIsOpen, className}) => {
  if (!isOpen) return null;
  
  return (
		<div
			onClick={(e) => {
				e.stopPropagation();
				setIsOpen(false);
			}}
			className="z-50 absolute bg-black bg-opacity-40 w-screen h-screen inset-0 grid place-items-center"
		>
				{React.cloneElement(children as React.ReactElement<any>, {
					isOpen,
					setIsOpen,
					onClick: (e: React.MouseEvent) => e.stopPropagation(),
				})}
		</div>
	);
}