import { writable } from 'svelte/store';

interface ConfirmationState {
  show: boolean;
  title: string;
  message: string;
  onConfirm: (() => void) | null;
  onCancel: (() => void) | null;
}

const initialState: ConfirmationState = {
  show: false,
  title: '',
  message: '',
  onConfirm: null,
  onCancel: null,
};

const { subscribe, set } = writable<ConfirmationState>(initialState);

export const confirmationStore = {
  subscribe,
  showConfirmation: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => {
    set({
      show: true,
      title,
      message,
      onConfirm,
      onCancel: onCancel || null,
    });
  },
  hideConfirmation: () => {
    set({ ...initialState });
  },
};
