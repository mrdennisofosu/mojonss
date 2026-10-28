// The standard spacing and width for a dashboard page.
function PageContainer({ children }) {
  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      {children}
    </div>
  );
}

export default PageContainer;
