import { useState, useEffect } from 'react';
import { Save, Brain, Thermometer, MessageSquare, Zap } from 'lucide-react';

interface SettingsData {
  model_name: string;
  temperature: number;
  max_tokens: number;
  system_prompt: string;
}

interface SettingsProps {
  settings: SettingsData | null;
  onSaveSettings: (settings: SettingsData) => void;
}

export function Settings({ settings, onSaveSettings }: SettingsProps) {
  const [formData, setFormData] = useState<SettingsData>({
    model_name: 'LLaMA-3',
    temperature: 0.7,
    max_tokens: 2048,
    system_prompt: 'You are Jarvis, a helpful AI assistant.',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
            <p className="text-slate-600 mt-1">
              Configure your JARVIS AI assistant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-cyan-600" />
                <label className="block text-sm font-medium text-slate-700">
                  Model Name
                </label>
              </div>
              <select
                value={formData.model_name}
                onChange={(e) =>
                  setFormData({ ...formData, model_name: e.target.value })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="LLaMA-3">LLaMA-3</option>
                <option value="LLaMA-2">LLaMA-2</option>
                <option value="Mistral-7B">Mistral-7B</option>
                <option value="Custom">Custom Model</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Select the language model to power JARVIS
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Thermometer size={18} className="text-cyan-600" />
                <label className="block text-sm font-medium text-slate-700">
                  Temperature: {formData.temperature}
                </label>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.temperature}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    temperature: parseFloat(e.target.value),
                  })
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>More Focused</span>
                <span>More Creative</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Controls randomness in responses. Lower is more deterministic,
                higher is more creative.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-cyan-600" />
                <label className="block text-sm font-medium text-slate-700">
                  Max Tokens
                </label>
              </div>
              <input
                type="number"
                min="128"
                max="8192"
                step="128"
                value={formData.max_tokens}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_tokens: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-500 mt-1">
                Maximum length of generated responses (128-8192 tokens)
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare size={18} className="text-cyan-600" />
                <label className="block text-sm font-medium text-slate-700">
                  System Prompt
                </label>
              </div>
              <textarea
                value={formData.system_prompt}
                onChange={(e) =>
                  setFormData({ ...formData, system_prompt: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                placeholder="Define JARVIS's personality and behavior..."
              />
              <p className="text-xs text-slate-500 mt-1">
                Customize how JARVIS behaves and responds to your queries
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg hover:from-cyan-700 hover:to-blue-800 transition-all font-medium"
              >
                <Save size={18} />
                Save Settings
              </button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-2">
            About Self-Hosted AI
          </h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            JARVIS is powered by self-hosted large language models, giving you
            complete control over your data and privacy. The system uses vector
            databases for efficient knowledge retrieval and context-aware
            responses.
          </p>
        </div>
      </div>
    </div>
  );
}
