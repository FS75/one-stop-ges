import React from 'react'

interface OptionsProps {
    onCheckboxChange: (newState: boolean) => void
}

const Options: React.FC<OptionsProps> = ({ onCheckboxChange }) => {
    return (
        <div className="flex cursor-default select-none">
            <div className="flex items-center mr-4 cursor-default select-none">
                <input
                    id="inline-checkbox"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    onChange={event => onCheckboxChange(event.target.checked)}
                ></input>
                <label htmlFor="inline-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300 cursor-default select-none">
                    Remove rows with no data
                </label>
            </div>
            {/* <div className="flex items-center mr-4">
                <input
                    id="inline-checkbox"
                    type="checkbox"
                    value=""
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    // onChange={event => onCheckboxChange(event.target.checked)}
                ></input>
                <label htmlFor="inline-checkbox" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                    Placeholder
                </label>
            </div> */}
        </div>
    )
}

export default Options
