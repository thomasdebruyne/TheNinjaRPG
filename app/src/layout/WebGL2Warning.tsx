import React from "react";
import ContentBox from "@/layout/ContentBox";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface WebGL2WarningProps {
  onProceed: () => void;
}

/**
 * Component that displays a warning when WebGL2 is not supported
 * Allows user to proceed anyway or refresh the page
 */
const WebGL2Warning: React.FC<WebGL2WarningProps> = ({ onProceed }) => {
  return (
    <ContentBox
      title="WebGL2 Not Supported"
      subtitle="Your browser does not support WebGL2"
      alreadyHasH1
      defaultBackHref="/"
    >
      <div className="flex flex-col items-center justify-center space-y-4 p-6">
        <AlertTriangle className="w-20 h-20 text-orange-500" />
        <div className="text-center space-y-2">
          <p className="font-bold text-lg">Limited Functionality Warning</p>
          <p className="text-muted-foreground">
            WebGL2 is required for core game features. You will NOT be able to:
          </p>
          <ul className="text-left inline-block text-muted-foreground space-y-1">
            <li>• Engage in combat</li>
            <li>• Travel on the map</li>
            <li>• View 3D graphics and animations</li>
          </ul>
          <p className="text-muted-foreground pt-2">
            Please update your browser to the latest version for the full experience.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button variant="default" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="destructive" onClick={onProceed}>
            Proceed Anyway
          </Button>
        </div>
      </div>
    </ContentBox>
  );
};

/**
 * Small banner component to show persistent warning after user proceeds
 */
export const WebGL2WarningBanner: React.FC = () => {
  return (
    <div className="mb-4 p-4 bg-orange-500/10 border border-orange-500 rounded-md">
      <div className="flex items-center gap-2 text-orange-500">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-semibold">WebGL2 Not Available</span>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        You will not be able to use combat or travel features.
      </p>
    </div>
  );
};

export default WebGL2Warning;
