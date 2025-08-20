interface inputProps {
    val: string;
    inId: string;
    options: string[];
    setter: (e: any) => void;
}

const DropDown = ({val, inId, options, setter}:inputProps) => {
    return (
        <div className="tblDD">
            <select
                className="hoverLn shipInput"
                data-testid={inId}
                id={inId}
                value={val}
                onChange={setter}
            >
                <option value="" id="" key="" className="shipValue"/>
                {
                    options.map((e: any) => (
                        <option
                            value={e}
                            key={e}
                            className="shipValue"
                        >
                            {e}
                        </option>
                    ))}
            </select>
        </div>
    );
};

export default DropDown;
