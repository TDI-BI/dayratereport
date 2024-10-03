interface inputProps {
    val: string;
    inid: string;
    options: string[];
    setter: (e:any) => void;
}

const DropDown: React.FC<inputProps> = ({val, inid, options, setter}) => {
    return (
        <div className="tblDD">
            <select
                className="hoverLn shipInput"
                id={inid}
                value={val}
                onChange={setter}
            >
                <option value="" id="" key="" className="shipValue" />
                {
                    options.map((e:any)=>
                        <option
                            value={e}
                            label={e}
                            key={e}
                            className="shipValue"
                        />
                    )
                }
            </select>
        </div>
    );
};

export default DropDown;
