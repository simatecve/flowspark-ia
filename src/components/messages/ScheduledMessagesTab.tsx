
import React from 'react';
import { ScheduledMessagesList } from './ScheduledMessagesList';

export const ScheduledMessagesTab = () => {
  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto p-4">
        <ScheduledMessagesList />
      </div>
    </div>
  );
};
