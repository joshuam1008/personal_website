import React, { useContext } from 'react';
import { termContext } from '../termContext';

const Echo: React.FC = () => {
  const { arg } = useContext(termContext);
  const text = arg.join(' ');
  return <div>{text || <span className="term-dim">(empty)</span>}</div>;
};

export default Echo;
