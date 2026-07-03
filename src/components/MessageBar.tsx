interface MessageBarProps {
  message: string | null;
}

export default function MessageBar({ message }: MessageBarProps) {
  return (
    <div className="message-row" role="status" aria-live="polite">
      {message ? (
        <span className="message" key={message}>
          {message}
        </span>
      ) : null}
    </div>
  );
}
