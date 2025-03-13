import MkaccountForm from "@/components/mkaccountForm";
const mkaccountPage = async () => {
    return (
        <main className="flex min-h-screen flex-col items-center px-5">
            {/* we are gonna convert this to a form at some point i thinkge */}
            <MkaccountForm />
        </main>
    );
};

export default mkaccountPage;
