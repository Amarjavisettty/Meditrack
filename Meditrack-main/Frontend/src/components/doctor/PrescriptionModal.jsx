import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Pill, Clock, AlertTriangle } from "lucide-react";

const PrescriptionModal = ({ appointment, onClose, onSubmit }) => {
  const [prescription, setPrescription] = useState({
    medicines: [],
    instructions: "",
    followUpDate: "",
  });
  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
  });

  useEffect(() => {
    // Pre-fill if appointment already has prescription
    if (appointment.prescription) {
      setPrescription({
        medicines: appointment.prescription.medicines || [],
        instructions: appointment.prescription.instructions || "",
        followUpDate: appointment.prescription.followUpDate
          ? new Date(appointment.prescription.followUpDate)
              .toISOString()
              .split("T")[0]
          : "",
      });
    }
  }, [appointment]);

  const handleAddMedicine = () => {
    if (
      !newMedicine.name ||
      !newMedicine.dosage ||
      !newMedicine.frequency ||
      !newMedicine.duration
    ) {
      alert("Please fill all medicine fields");
      return;
    }

    setPrescription((prev) => ({
      ...prev,
      medicines: [...prev.medicines, { ...newMedicine, id: Date.now() }],
    }));

    setNewMedicine({
      name: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    });
  };

  const handleRemoveMedicine = (id) => {
    setPrescription((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((med) => med.id !== id),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (prescription.medicines.length === 0) {
      alert("Please add at least one medicine");
      return;
    }

    const submissionData = {
      ...prescription,
      medicines: prescription.medicines.map(({ id, ...med }) => med), // Remove temporary id
    };

    onSubmit(submissionData);
  };

  const frequencyOptions = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "As needed",
    "Before meals",
    "After meals",
    "At bedtime",
  ];

  const durationOptions = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "30 days",
    "As needed",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Prescription</h2>
              <p className="opacity-90">Patient: {appointment.patient.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]"
        >
          {/* Add Medicine Section */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-blue-500" />
              Add Medicine
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name *
                </label>
                <input
                  type="text"
                  value={newMedicine.name}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Paracetamol"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={newMedicine.dosage}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      dosage: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., 500mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency *
                </label>
                <select
                  value={newMedicine.frequency}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      frequency: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map((freq) => (
                    <option key={freq} value={freq}>
                      {freq}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration *
                </label>
                <select
                  value={newMedicine.duration}
                  onChange={(e) =>
                    setNewMedicine((prev) => ({
                      ...prev,
                      duration: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select duration</option>
                  {durationOptions.map((duration) => (
                    <option key={duration} value={duration}>
                      {duration}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Instructions
              </label>
              <input
                type="text"
                value={newMedicine.instructions}
                onChange={(e) =>
                  setNewMedicine((prev) => ({
                    ...prev,
                    instructions: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Take with food"
              />
            </div>

            <button
              type="button"
              onClick={handleAddMedicine}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Medicine</span>
            </button>
          </div>

          {/* Medicine List */}
          {prescription.medicines.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Pill className="h-5 w-5 mr-2 text-green-500" />
                Prescribed Medicines ({prescription.medicines.length})
              </h3>

              <div className="space-y-3">
                {prescription.medicines.map((medicine, index) => (
                  <div
                    key={medicine.id || index}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              Medicine
                            </span>
                            <p className="font-semibold text-gray-800">
                              {medicine.name}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Dosage
                            </span>
                            <p className="font-semibold text-gray-800">
                              {medicine.dosage}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Frequency
                            </span>
                            <p className="font-semibold text-gray-800">
                              {medicine.frequency}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Duration
                            </span>
                            <p className="font-semibold text-gray-800">
                              {medicine.duration}
                            </p>
                          </div>
                        </div>
                        {medicine.instructions && (
                          <div className="mt-2">
                            <span className="text-sm text-gray-500">
                              Instructions:{" "}
                            </span>
                            <span className="text-sm text-gray-700">
                              {medicine.instructions}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveMedicine(medicine.id || index)
                        }
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* General Instructions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              General Instructions
            </label>
            <textarea
              value={prescription.instructions}
              onChange={(e) =>
                setPrescription((prev) => ({
                  ...prev,
                  instructions: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional instructions for the patient..."
            />
          </div>

          {/* Follow-up Date */}
          <div className="mb-6">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 mr-2" />
              Follow-up Date (Optional)
            </label>
            <input
              type="date"
              value={prescription.followUpDate}
              onChange={(e) =>
                setPrescription((prev) => ({
                  ...prev,
                  followUpDate: e.target.value,
                }))
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-yellow-800">
                  Important
                </h4>
                <p className="text-sm text-yellow-700">
                  Please ensure all medicine details are accurate. This
                  prescription will be sent to the patient.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={prescription.medicines.length === 0}
              className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {appointment.prescription
                ? "Update Prescription"
                : "Submit Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PrescriptionModal;
