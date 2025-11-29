# RSpec Testing Standards

## Test Structure

Organize tests with clear describe/context/it hierarchy:

```ruby
RSpec.describe ConsultationCreator do
  describe '#call' do
    subject(:result) { described_class.new(user, params).call }
    
    let(:user) { create(:user) }
    let(:params) { { title: 'Test', scheduled_at: 1.day.from_now } }
    
    context 'when params are valid' do
      it 'creates a consultation' do
        expect { result }.to change(Consultation, :count).by(1)
      end
      
      it 'returns success' do
        expect(result[:success]).to be true
      end
      
      it 'schedules notification job' do
        expect(ConsultationNotificationJob).to receive(:perform_later)
        result
      end
    end
    
    context 'when params are invalid' do
      let(:params) { { title: nil } }
      
      it 'does not create a consultation' do
        expect { result }.not_to change(Consultation, :count)
      end
      
      it 'returns failure' do
        expect(result[:success]).to be false
      end
      
      it 'returns errors' do
        expect(result[:errors]).to be_present
      end
    end
    
    context 'with edge cases' do
      let(:params) { { title: 'A' * 1000 } }  # Very long title
      
      it 'handles gracefully' do
        # test
      end
    end
  end
end
```

---

## Test Organization Patterns

### Use subject for the main test target

```ruby
# Good
subject(:service) { described_class.new(user, params) }

it 'creates a record' do
  expect { service.call }.to change(Record, :count).by(1)
end

# Bad
it 'creates a record' do
  service = described_class.new(user, params)
  expect { service.call }.to change(Record, :count).by(1)
end
```

### Use let for test data setup

```ruby
# Good
let(:user) { create(:user) }
let(:consultation) { create(:consultation, user: user) }

# Bad - duplicated setup in each test
it 'does something' do
  user = create(:user)
  consultation = create(:consultation, user: user)
  # test
end
```

---

## Use Descriptive Test Names

Test names should clearly describe what is being tested:

```ruby
# Good
it 'creates a consultation when params are valid' do
end

it 'returns an error when user is not authenticated' do
end

it 'sends notification email after successful creation' do
end

# Bad
it 'works' do
end

it 'test 1' do
end

it 'should do the thing' do  # Avoid "should" in test names
end
```

---

## Use Factories (FactoryBot)

Prefer factories over manual record creation:

```ruby
# Good
let(:user) { create(:user, :with_profile) }
let(:consultation) { build(:consultation, user: user) }

# Bad - verbose manual creation
let(:user) do
  User.create!(
    email: 'test@example.com',
    password: 'password',
    first_name: 'John',
    last_name: 'Doe',
    role: 'member',
    active: true,
    # ... 15 more attributes
  )
end
```