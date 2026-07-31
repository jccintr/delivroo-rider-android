// Hook para controlar o AlertModal sem repetir useState em cada tela.
//
// Uso:
//   const alert = useAlertModal();
//   alert.show({ type: 'error', title: 'Ops!', message: 'E-mail ou senha incorretos.' });
//
//   <AlertModal {...alert.props} />
// useAlertModal.js
// useAlertModal.js
import { useState, useCallback, useRef } from 'react';

export default function useAlertModal() {
  const [state, setState] = useState({
    visible: false,
    type: 'error',
    title: '',
    message: '',
    confirmText: undefined,
  });

  // Guarda o callback sem causar re-render
  const onCloseCallbackRef = useRef(null);

  const show = useCallback(({ type = 'error', title, message, confirmText, onClose }) => {
    onCloseCallbackRef.current = onClose || null;
    setState({ visible: true, type, title, message, confirmText });
  }, []);

  const hide = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));

    // Executa o callback depois de fechar
    if (onCloseCallbackRef.current) {
      const cb = onCloseCallbackRef.current;
      onCloseCallbackRef.current = null;
      cb();
    }
  }, []);

  return {
    show,
    hide,
    props: {
      visible: state.visible,
      type: state.type,
      title: state.title,
      message: state.message,
      confirmText: state.confirmText,
      onClose: hide,
    },
  };
}