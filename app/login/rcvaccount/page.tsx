import RecoverForm from "@/components/recoverForm";
const rcvaccountPage = async () => {
    return (
        <main className="flex min-h-screen flex-col items-center">
            {/* we are gonna convert this to a form at some point i thinkge */}
            <p> check spam for emails</p>
            <RecoverForm />
        </main>
    );
};

export default rcvaccountPage;
