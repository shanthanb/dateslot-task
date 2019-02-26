import React from "react";
import Picker from "react-mobile-picker";

class App extends React.Component {
  state = {
    title: "",
    data: {},
    disableBtn: true,
    valueGroups: {
      date: "",
      hour: "",
      minute: ""
    },
    optionGroups: {
      date: [""],
      hour: [""],
      minute: [""]
    },
    selectedSlot: {
      data : "",
      slotId : ""
    }
  };

  middleIndexOfArray = (array) => {
    return Math.floor(array.length/2 - 1);
  };


  initialSetup = (selectedDate) => {
    const data = this.state.data;
    this.setState({
      optionGroups: {
        date: Object.keys(data),
        hour: ["No slot available this day"]
      }
    });
    this.setState({
      valueGroups: {
        date: selectedDate,
        hour: ["No slot available this day"]
      }
    });
    if(this.state.data[selectedDate].length){
      this.setState({
        optionGroups: {
          ...this.state.optionGroups,
          hour: Object.keys(data[selectedDate])
        }
      });
      this.setState({
        valueGroups: {
          ...this.state.valueGroups,
          hour: this.state.optionGroups.hour[this.middleIndexOfArray(this.state.optionGroups.hour)]
        }
      });
      this.updateMinute(selectedDate, this.state.valueGroups.hour);
    }
  };

  updateMinute = (selectedDate, selectedHour) => {
    const data = this.state.data;
    console.log(JSON.stringify(data[selectedDate]));
    console.log("minutes : " + JSON.stringify(data[selectedDate][selectedHour]));
    if(data[selectedDate][selectedHour]){
      this.setState(() => ({
          optionGroups: {
            ...this.state.optionGroups,
            minute: data[selectedDate][selectedHour].map((time) => {
              return Object.keys(time);
            })
          }
        }),
        () => (
          this.setState({
            valueGroups: {
              ...this.state.valueGroups,
              minute: this.state.optionGroups.minute[this.middleIndexOfArray(this.state.optionGroups.minute)]
            }
          })
        )
      );
    };
  };

  componentDidMount(){
    //Reading data from json file
    fetch('./data.json').then(response => {
      return response.json();
    }).then(data => {
      // Below steps are used to convert data to structure which is simple to fetch
      this.setState({title: data.title});
      if(data["available_slots"].length !== 0){
        let availableSlots = {};
        data["available_slots"].forEach(slot => {
          if(slot["date_slots"]){
            let availableHour = [];
            slot["date_slots"].forEach(hours => {
              availableHour[hours.hour] = hours["hour_slots"];
            });
            availableSlots[slot.date] = availableHour;
          }
        });
        this.setState({data: availableSlots});
      }
      this.initialSetup("Today");
    }).catch(err => {
      // Do something for an error here
      console.log("Error Reading data " + err);
    });
  };

  // Update the value in response to user picking event
  handleChange = (name, value) => {
    console.log(`Name : ${name}, Value : ${value}`);
    if(name === "date"){
      this.initialSetup(value);
    }else if(name === "hour"){
      if(value !== "No slot available this day") {
        this.setState({
          disableBtn : false
        });
        console.log(this.state.valueGroups.date);
        this.updateMinute(this.state.valueGroups.date, value);
      }else{
        this.setState({
          disableBtn : true,
          selectedSlot: {
            date: "",
            slotId : ""
          }
        })
      }
    }
    this.setState(({ valueGroups }) => ({
      valueGroups: {
      
        ...valueGroups,
        [name]: value
      }
    }));
  };

  confirmDate = () => {
    const valueGroup = this.state.valueGroups;
    if(valueGroup.hour.toString() !== "No slot available for this day"){
      let slotId = "";
      // eslint-disable-next-line
      this.state.data[valueGroup.date][valueGroup.hour].map((hour_slot) => {
        if (Object.keys(hour_slot)[0] === valueGroup.minute.toString()) {
          slotId =  hour_slot[this.state.valueGroups.minute];
        }
      });
      this.setState({
        selectedSlot: {
          date: this.state.valueGroups.date,
          slotId
        }
      })
    }else{

    }
  };

  render() {
    const {title, optionGroups, valueGroups, selectedSlot } = this.state;
    console.log(JSON.stringify(selectedSlot));
    return (
      <div>
        <h2 style={{textAlign: "center"}}>{title}</h2>
        <Picker 
          optionGroups={optionGroups}
          valueGroups={valueGroups}
          onChange={this.handleChange}
          />

          <div style={{display: "flex", justifyContent: "center"}}>
          <button onClick={this.confirmDate} disabled={this.state.disableBtn}>Confirm Date</button>
        </div>
        <div>
          Selected Slot: {`${valueGroups.date} ${valueGroups.minute}`}
        </div>
        <div>
          Return value: {`${selectedSlot.date} ${selectedSlot.slotId}`}
        </div>
      </div>
    );
  }
}

export default App;
