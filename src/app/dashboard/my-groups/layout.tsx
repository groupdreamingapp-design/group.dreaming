
export default function MyGroupsLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
        <div className="flex flex-col gap-6">
            {children}
        </div>
    );
  }
  