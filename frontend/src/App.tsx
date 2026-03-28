import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useAppDispatch } from '@app/hooks';
import { checkAuth } from '@features/auth/auth.thunks';
import { AppRouter } from '@routes/index';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
