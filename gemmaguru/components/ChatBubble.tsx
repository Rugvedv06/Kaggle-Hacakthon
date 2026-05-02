export default function ChatBubble({ message, isUser }: { message: string, isUser: boolean }) {
  return (
    <div className={`p-4 rounded-lg ${isUser ? 'bg-blue-100' : 'bg-gray-100'}`}>
      {message}
    </div>
  );
}
