import { useContext } from 'react';
import { termContext } from '../termContext';

const Pwd = () => {
  const { currentPath } = useContext(termContext);
  return <div className="term-dim">{currentPath ?? '/home/visitor'}</div>;
};

export default Pwd;
