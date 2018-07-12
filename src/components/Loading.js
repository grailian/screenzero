import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const Loading = () => {
  return (
    <div style={styles.loading}>
      <CircularProgress size={72} color="primary" />
    </div>
  );
};

export default Loading;

const styles = {
  loading: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
  },
};

