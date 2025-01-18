import { ChevronRight } from "lucide-react";

export const NextMatch = () => {
    return (
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Próximo partido</h2>
              <button className="text-sm text-teal-600 hover:text-teal-700 flex items-center">
                Ver calendario
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center space-y-6 sm:space-y-0 sm:space-x-12 py-4 sm:py-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold">LDU</span>
                </div>
                <p className="font-semibold">Liga</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">VS</div>
                <div className="text-sm text-gray-500">15:00 - Estadio Catzuqui</div>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                  <span className="text-lg font-bold">AUC</span>
                </div>
                <p className="font-semibold">Aucas</p>
              </div>
            </div>
          </div>
    );
}