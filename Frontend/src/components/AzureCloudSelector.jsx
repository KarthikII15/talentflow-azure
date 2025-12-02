import { useEffect, useState } from "react";
import { useAzure, destroyAzure, getAzureStatus } from "../api/cloudApi";
import { toast } from "sonner";

export default function CloudSelector() {
    const [azureStatus, setAzureStatus] = useState("not_provisioned");
    const environment = "dev";

    const refreshStatus = async () => {
        try {
            const res = await getAzureStatus(environment);
            setAzureStatus(res.status);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch Azure status");
        }
    };

    useEffect(() => {
        refreshStatus();
    }, []);

    const handleUseAzure = async () => {
        try {
            const res = await useAzure(environment);
            setAzureStatus(res.status);
            if (res.status === "ready") {
                toast.success("Azure is already configured and ready!");
            } else if (res.status === "provisioning") {
                toast.info("Azure provisioning started.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to start Azure provisioning");
        }
    };

    const handleDestroyAzure = async () => {
        try {
            const res = await destroyAzure(environment);
            setAzureStatus(res.status);
            if (res.status === "destroying") {
                toast.warning("Destroying Azure infra...");
            } else if (res.status === "not_provisioned") {
                toast.info("No Azure infra to destroy.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to destroy Azure infra");
        }
    };

    const renderStatusLabel = () => {
        switch (azureStatus) {
            case "ready":
                return <span className="text-sm text-green-400">✅ Azure ready</span>;
            case "provisioning":
                return (
                    <span className="text-sm text-yellow-400">
                        ⏳ Provisioning Azure…
                    </span>
                );
            case "deleting":
            case "destroying":
                return (
                    <span className="text-sm text-red-400">
                        🗑️ Destroying Azure infra…
                    </span>
                );
            case "not_provisioned":
                return (
                    <span className="text-sm text-gray-500">
                        Azure not provisioned yet.
                    </span>
                );
            default:
                return (
                    <span className="text-sm text-gray-500">
                        Azure status: {azureStatus}
                    </span>
                );
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <button
                    onClick={handleUseAzure}
                    className="px-4 py-2 rounded-lg border bg-blue-600 text-white hover:bg-blue-500 border-blue-500"
                >
                    Use Azure
                </button>

                <button
                    onClick={handleDestroyAzure}
                    className="px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10"
                >
                    Destroy Azure
                </button>

                <button
                    onClick={refreshStatus}
                    className="px-3 py-2 text-xs rounded border border-gray-600 text-gray-400 hover:bg-gray-800"
                >
                    Refresh status
                </button>
            </div>

            {renderStatusLabel()}
        </div>
    );
}
