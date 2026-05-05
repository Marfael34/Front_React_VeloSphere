import React from 'react';

const FormattedDescription = ({ text, className = "" }) => {
    if (!text) return null;

    // Découpage par ligne pour traiter les tirets et les colons
    const lines = text.split('\n');

    return (
        <div className={`space-y-2 ${className}`}>
            {lines.map((line, index) => {
                let trimmedLine = line.trim();
                if (!trimmedLine) return <div key={index} className="h-2" />; // Espace pour les lignes vides

                // Gestion des listes (lignes commençant par -)
                const isListItem = trimmedLine.startsWith('-');
                if (isListItem) {
                    trimmedLine = trimmedLine.substring(1).trim();
                }

                // Gestion des titres (texte avant :)
                const colonIndex = trimmedLine.indexOf(':');
                let renderedContent;

                if (colonIndex !== -1) {
                    const title = trimmedLine.substring(0, colonIndex).trim();
                    const rest = trimmedLine.substring(colonIndex + 1).trim();
                    renderedContent = (
                        <>
                            <span className="font-bold text-orange">{title}:</span>
                            {rest && <span className="ml-1">{rest}</span>}
                        </>
                    );
                } else {
                    renderedContent = <span>{trimmedLine}</span>;
                }

                if (isListItem) {
                    return (
                        <div key={index} className="flex gap-3 ml-4 animate-slideup" style={{ animationDelay: `${index * 50}ms` }}>
                            <span className="text-orange font-bold">•</span>
                            <div className="flex-1">{renderedContent}</div>
                        </div>
                    );
                }

                return (
                    <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                        {renderedContent}
                    </div>
                );
            })}
        </div>
    );
};

export default FormattedDescription;
