

type BaseCustomDialogProps<T> = {
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & T;