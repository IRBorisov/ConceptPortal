import {memo, type FC} from 'react';
import {Handle, Position, type NodeProps} from '@reactflow/core';

const InputNode: FC<NodeProps> = ({data, xPos, yPos}) => {
    return (
        <>
            <Handle type="target" position={Position.Bottom}/>
            <div>
                <div>
                    Тип: <strong>{data.label}</strong>
                </div>
                <div>
                    Схема из библиотеки:{' '}
                    <strong>
                        RSForm
                    </strong>
                </div>
            </div>

        </>
    );
};

export default memo(InputNode);
