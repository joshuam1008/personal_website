import { Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  animationDescriptions,
  type AnimationConfig,
  getAnimationConfig,
  saveAnimationConfig,
} from '@config/animations';

export default function AnimationSettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AnimationConfig>(() => getAnimationConfig());

  useEffect(() => {
    setConfig(getAnimationConfig());
  }, []);

  const handleToggle = (key: keyof AnimationConfig) => {
    const updated = { ...config, [key]: !config[key] };
    setConfig(updated);
    saveAnimationConfig(updated);

    // Trigger page reload to apply animation changes
    window.dispatchEvent(new CustomEvent('animation-config-changed', { detail: updated }));
  };

  const handleReset = () => {
    const defaults = getAnimationConfig();
    setConfig(defaults);
    saveAnimationConfig(defaults);
    window.dispatchEvent(new CustomEvent('animation-config-changed', { detail: defaults }));
  };

  return (
    <>
      {/* Settings Button - Bottom Right Corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-surface/90 text-neutral-200 shadow-2xl backdrop-blur-xl transition hover:border-white/30 hover:text-white hover:scale-110"
        aria-label="Animation settings"
      >
        <Settings className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Settings Panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md transform border-l border-white/10 bg-surface/95 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-lg font-semibold text-white">Animation Settings</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-neutral-400 transition hover:text-white"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Settings List */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {(Object.keys(config) as Array<keyof AnimationConfig>).map((key) => (
                <div
                  key={String(key)}
                  className="flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-1">
                    <label
                      htmlFor={String(key)}
                      className="text-sm font-medium text-white cursor-pointer"
                    >
                      {animationDescriptions[key]}
                    </label>
                  </div>
                  <button
                    id={String(key)}
                    onClick={() => handleToggle(key)}
                    className={`relative h-6 w-11 rounded-full transition ${
                      config[key] ? 'bg-accent' : 'bg-white/20'
                    }`}
                    aria-label={`Toggle ${animationDescriptions[key]}`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition ${
                        config[key] ? 'left-[22px]' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 p-6">
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-neutral-200 transition hover:border-white/40 hover:text-white"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
