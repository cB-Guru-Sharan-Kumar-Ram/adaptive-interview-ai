import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { hideError } from '../../store/slices/errorSlice';

const ErrorToast = () => {
    const { message, type, visible } = useSelector((state) => state.error);
    const dispatch = useDispatch();

    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                dispatch(hideError());
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [visible, dispatch]);

    if (!visible || !message) return null;

    const bgColor = type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
    const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';
    const iconColor = type === 'error' ? 'text-red-600' : 'text-green-600';

    return (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
            <div className={`${bgColor} border rounded-lg p-4 shadow-lg`}>
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {type === 'error' ? (
                            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className={`w-5 h-5 ${iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className={`text-sm font-medium ${textColor}`}>
                            {type === 'error' ? 'Error' : 'Success'}
                        </h3>
                        <p className={`mt-1 text-sm ${textColor}`}>{message}</p>
                    </div>
                    <button
                        onClick={() => dispatch(hideError())}
                        className={`ml-3 flex-shrink-0 ${iconColor} hover:opacity-75`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorToast;
