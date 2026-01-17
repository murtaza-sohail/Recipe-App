import React from 'react';

const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
    return (
        <div 
            className={`skeleton-loader ${className}`}
            style={{ 
                width: width || '100%', 
                height: height || '20px', 
                borderRadius 
            }}
        />
    );
};

export const RecipeCardSkeleton = () => (
    <div className="card" style={{ pointerEvents: 'none' }}>
        <Skeleton height="220px" borderRadius="0" />
        <div className="card-body">
            <Skeleton width="80%" height="24px" className="mb-2" />
            <Skeleton width="40%" height="16px" />
        </div>
    </div>
);

export const CategorySkeleton = () => (
    <div className="card" style={{ height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', pointerEvents: 'none' }}>
        <Skeleton width="80px" height="80px" borderRadius="50%" className="mb-2" />
        <Skeleton width="100px" height="18px" />
    </div>
);

export default Skeleton;
