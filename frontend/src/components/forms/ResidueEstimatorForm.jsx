import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CROP_TYPES, DEMO_LOCATIONS } from '../../utils/constants';

const schema = z.object({
  cropType: z.string().min(1, 'Please select a crop type'),
  cultivatedArea: z.number().min(0.1, 'Area must be at least 0.1 hectare'),
  estimatedHarvestQuantity: z.number().min(1, 'Harvest quantity must be at least 1 quintal'),
  location: z.string().min(1, 'Please select a location'),
});

const ResidueEstimatorForm = ({ onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useHookForm({
    resolver: zodResolver(schema),
    defaultValues: {
      cropType: '',
      cultivatedArea: '',
      estimatedHarvestQuantity: '',
      location: '',
    },
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-semibold text-gray-900">Calculate Crop Residue</h2>
        <p className="text-gray-500 mt-1">Enter your harvest details to estimate available waste.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Crop Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
            <select
              {...register('cropType')}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3 bg-gray-50 text-gray-900"
            >
              <option value="">Select a crop</option>
              {CROP_TYPES.map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
            {errors.cropType && <p className="mt-1 text-sm text-red-600">{errors.cropType.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Farm Location</label>
            <select
              {...register('location')}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3 bg-gray-50 text-gray-900"
            >
              <option value="">Select location</option>
              {DEMO_LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>}
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cultivated Area (Hectares)</label>
            <input
              type="number"
              step="0.1"
              {...register('cultivatedArea', { valueAsNumber: true })}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3 bg-gray-50 text-gray-900"
              placeholder="e.g. 5.5"
            />
            {errors.cultivatedArea && <p className="mt-1 text-sm text-red-600">{errors.cultivatedArea.message}</p>}
          </div>

          {/* Harvest */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Harvest (kg)</label>
            <input
              type="number"
              {...register('estimatedHarvestQuantity', { valueAsNumber: true })}
              className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 px-4 py-3 bg-gray-50 text-gray-900"
              placeholder="e.g. 5000"
            />
            {errors.estimatedHarvestQuantity && (
              <p className="mt-1 text-sm text-red-600">{errors.estimatedHarvestQuantity.message}</p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-medium rounded-full hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Estimating...
              </>
            ) : (
              'Calculate Estimate'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResidueEstimatorForm;
