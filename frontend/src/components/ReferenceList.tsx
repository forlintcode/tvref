// components/ReferenceList.jsx
import React from 'react';

const ReferenceList = ({ references }) => {
  if (!references || Object.keys(references).length === 0) {
    return <div className="text-gray-500">No references found.</div>;
  }

  return (
    <div className="mt-4 space-y-4">
      {Object.entries(references).map(([referencedTitle, mentions]) => (
        <div key={referencedTitle} className="p-4 bg-white shadow rounded-xl">
          <h2 className="text-lg font-bold mb-2 text-indigo-600">{referencedTitle}</h2>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {mentions.map((m, idx) => (
              <li key={idx}>
                <span className="font-medium">{m.episode}</span>: {m.line}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ReferenceList;
