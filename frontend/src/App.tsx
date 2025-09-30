import { useEffect } from 'react';
import { AppRoutes } from './routes/AppRoutes.tsx';
import { useAppDispatch, useAppSelector } from './hooks/index.ts';
import { fetchProfileThunk } from './features/auth/authSlice.ts';
import './App.css';

function App() {
  const dispatch = useAppDispatch();
  const { token, profileStatus } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (token && profileStatus === 'idle') {
      dispatch(fetchProfileThunk());
    }
  }, [token, profileStatus, dispatch]);

  return <AppRoutes />;
}

export default App;
