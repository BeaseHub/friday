declare global {
  interface Window {
    ElevenLabsConversationalAiWidgetSettings?: {
      projectId: string;
      dynamicVariables: {
        user_id: string;
      };
    };
  }
}

// File: frontend/src/hooks/useElevenLabsWidget.ts
import { useEffect } from "react";

export const useElevenLabsWidget = () => {
  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('auth') || '{}').user.id;

    if (!userId || window.ElevenLabsConversationalAiWidgetSettings) return;

    // Define global config
    window.ElevenLabsConversationalAiWidgetSettings = {
      projectId: "YOUR_PROJECT_ID",
      dynamicVariables: {
        user_id: userId
      }
    };

    // Inject script only once
    const scriptId = "elevenlabs-widget-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
};
