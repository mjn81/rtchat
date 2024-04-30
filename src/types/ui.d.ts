

type BaseCustomDialogProps<T> = {
  isOpen: boolean,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} & T;

type SideBarOption = {
	id: number;
	name: string;
  icon: LucideIcon;
  form: React.FC;
};