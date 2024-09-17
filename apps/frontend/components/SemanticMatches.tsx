import React from 'react';

interface SemanticMatch {
  id: number;
  similarity: number;
  content: string;
}

interface SemanticMatchesProps {
  matches: SemanticMatch[];
}

const SemanticMatches: React.FC<SemanticMatchesProps> = ({ matches }) => {
  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Semantic Matches:</h3>
      {matches.map((match, index) => (
        <div key={match.id} className="mb-2 p-2 bg-gray-100 rounded">
          <p><strong>Match {index + 1}</strong> (Similarity: {match.similarity.toFixed(2)})</p>
          <p className="text-sm">{match.content}</p>
        </div>
      ))}
    </div>
  );
};

export default SemanticMatches;